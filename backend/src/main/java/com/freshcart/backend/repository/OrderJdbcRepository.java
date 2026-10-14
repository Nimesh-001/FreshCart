package com.freshcart.backend.repository;

import com.freshcart.backend.dto.order.OrderItemResponse;
import com.freshcart.backend.dto.order.OrderResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class OrderJdbcRepository implements OrderRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall orderCheckoutCall;
    private SimpleJdbcCall orderCancelCall;
    private SimpleJdbcCall paymentProcessCall;

    private static final RowMapper<OrderItemResponse> ORDER_ITEM_ROW_MAPPER = (rs, rowNum) -> new OrderItemResponse(
            rs.getInt("order_item_id"),
            rs.getInt("order_id"),
            rs.getInt("product_id"),
            rs.getString("product_name"),
            rs.getInt("quantity"),
            rs.getBigDecimal("unit_price"),
            rs.getBigDecimal("subtotal")
    );

    private static final RowMapper<OrderResponse> ORDER_HISTORY_ROW_MAPPER = (rs, rowNum) -> new OrderResponse(
            rs.getInt("order_id"),
            rs.getInt("customer_id"),
            rs.getInt("address_id"),
            rs.getTimestamp("order_date"),
            rs.getString("status"),
            rs.getBigDecimal("total_amount"),
            rs.getInt("item_line_count"),
            rs.getInt("total_units")
    );

    public OrderJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.orderCheckoutCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_order_checkout")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_address_id", Types.INTEGER),
                        new SqlOutParameter("p_order_id", Types.INTEGER)
                );

        this.orderCancelCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_order_cancel")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_order_id", Types.INTEGER)
                );

        this.paymentProcessCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_payment_process")
                .declareParameters(
                        new SqlParameter("p_order_id", Types.INTEGER),
                        new SqlParameter("p_payment_method", Types.VARCHAR),
                        new SqlParameter("p_amount", Types.DECIMAL),
                        new SqlParameter("p_transaction_reference", Types.VARCHAR),
                        new SqlOutParameter("p_payment_id", Types.INTEGER)
                );
    }

    @Override
    public Integer checkout(Integer customerId, Integer addressId) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_address_id", addressId);

        Map<String, Object> out = orderCheckoutCall.execute(inParams);
        return (Integer) out.get("p_order_id");
    }

    @Override
    public void cancelOrder(Integer customerId, Integer orderId) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_order_id", orderId);

        orderCancelCall.execute(inParams);
    }

    @Override
    public void processPayment(Integer orderId, String paymentMethod, BigDecimal amount, String transactionReference) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_order_id", orderId)
                .addValue("p_payment_method", paymentMethod)
                .addValue("p_amount", amount)
                .addValue("p_transaction_reference", transactionReference);

        paymentProcessCall.execute(inParams);
    }

    @Override
    public List<OrderResponse> findOrderHistoryByCustomerId(Integer customerId) {
        List<OrderResponse> orders = jdbcTemplate.query("CALL sp_order_history(?)", ORDER_HISTORY_ROW_MAPPER, customerId);
        for (OrderResponse order : orders) {
            enrichPaymentInfo(order);
            List<OrderItemResponse> items = findOrderItemsByOrderId(order.getOrderId());
            order.setItems(items);
        }
        return orders;
    }

    @Override
    public Optional<OrderResponse> findOrderById(Integer orderId) {
        String sql = "SELECT order_id, customer_id, address_id, order_date, status, total_amount " +
                     "FROM orders WHERE order_id = ?";

        try {
            OrderResponse order = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                OrderResponse o = new OrderResponse();
                o.setOrderId(rs.getInt("order_id"));
                o.setCustomerId(rs.getInt("customer_id"));
                o.setAddressId(rs.getInt("address_id"));
                o.setOrderDate(rs.getTimestamp("order_date"));
                o.setStatus(rs.getString("status"));
                o.setTotalAmount(rs.getBigDecimal("total_amount"));
                return o;
            }, orderId);

            if (order != null) {
                List<OrderItemResponse> items = findOrderItemsByOrderId(orderId);
                order.setItems(items);
                order.setItemLineCount(items.size());
                order.setTotalUnits(items.stream().mapToInt(OrderItemResponse::getQuantity).sum());
                enrichPaymentInfo(order);
                return Optional.of(order);
            }
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    @Override
    public List<OrderItemResponse> findOrderItemsByOrderId(Integer orderId) {
        String sql = "SELECT " +
                     "    oi.order_item_id, " +
                     "    oi.order_id, " +
                     "    oi.product_id, " +
                     "    p.product_name, " +
                     "    oi.quantity, " +
                     "    oi.unit_price, " +
                     "    oi.subtotal " +
                     "FROM order_items oi " +
                     "JOIN products p ON oi.product_id = p.product_id " +
                     "WHERE oi.order_id = ? " +
                     "ORDER BY oi.order_item_id ASC";

        return jdbcTemplate.query(sql, ORDER_ITEM_ROW_MAPPER, orderId);
    }

    @Override
    public boolean existsById(Integer orderId) {
        String sql = "SELECT COUNT(*) FROM orders WHERE order_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, orderId);
        return count != null && count > 0;
    }

    private void enrichPaymentInfo(OrderResponse order) {
        String paymentSql = "SELECT payment_status, payment_method FROM payments WHERE order_id = ?";
        try {
            jdbcTemplate.query(paymentSql, rs -> {
                order.setPaymentStatus(rs.getString("payment_status"));
                order.setPaymentMethod(rs.getString("payment_method"));
            }, order.getOrderId());
        } catch (Exception ignored) {
            // No payment record exists yet
        }
    }
}
