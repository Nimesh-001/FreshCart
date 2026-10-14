package com.freshcart.backend.repository;

import com.freshcart.backend.dto.payment.PaymentResponse;
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
import java.util.Map;
import java.util.Optional;

@Repository
public class PaymentJdbcRepository implements PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall paymentProcessCall;
    private SimpleJdbcCall paymentRefundCall;

    private static final RowMapper<PaymentResponse> PAYMENT_ROW_MAPPER = (rs, rowNum) -> {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(rs.getInt("payment_id"));
        response.setOrderId(rs.getInt("order_id"));
        response.setPaymentMethod(rs.getString("payment_method"));
        response.setAmount(rs.getBigDecimal("amount"));
        response.setPaymentStatus(rs.getString("payment_status"));
        response.setTransactionReference(rs.getString("transaction_reference"));
        response.setPaymentDate(rs.getTimestamp("payment_date"));
        response.setOrderStatus(rs.getString("order_status"));
        boolean simulated = !"CASH_ON_DELIVERY".equalsIgnoreCase(response.getPaymentMethod());
        response.setIsSimulated(simulated);
        return response;
    };

    public PaymentJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.paymentProcessCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_payment_process")
                .declareParameters(
                        new SqlParameter("p_order_id", Types.INTEGER),
                        new SqlParameter("p_payment_method", Types.VARCHAR),
                        new SqlParameter("p_amount", Types.DECIMAL),
                        new SqlParameter("p_transaction_reference", Types.VARCHAR),
                        new SqlOutParameter("p_payment_id", Types.INTEGER)
                );

        this.paymentRefundCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_payment_refund")
                .declareParameters(
                        new SqlParameter("p_order_id", Types.INTEGER)
                );
    }

    @Override
    public Integer processPayment(Integer orderId, String paymentMethod, BigDecimal amount, String transactionReference) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_order_id", orderId)
                .addValue("p_payment_method", paymentMethod)
                .addValue("p_amount", amount)
                .addValue("p_transaction_reference", transactionReference);

        Map<String, Object> out = paymentProcessCall.execute(inParams);
        return (Integer) out.get("p_payment_id");
    }

    @Override
    public void processRefund(Integer orderId) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_order_id", orderId);

        paymentRefundCall.execute(inParams);
    }

    @Override
    public Optional<PaymentResponse> findPaymentByOrderId(Integer orderId) {
        String sql = "SELECT p.payment_id, p.order_id, p.payment_method, p.amount, p.payment_status, " +
                     "p.transaction_reference, p.payment_date, o.status AS order_status " +
                     "FROM payments p " +
                     "JOIN orders o ON p.order_id = o.order_id " +
                     "WHERE p.order_id = ?";

        try {
            PaymentResponse payment = jdbcTemplate.queryForObject(sql, PAYMENT_ROW_MAPPER, orderId);
            return Optional.ofNullable(payment);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<PaymentResponse> findPaymentById(Integer paymentId) {
        String sql = "SELECT p.payment_id, p.order_id, p.payment_method, p.amount, p.payment_status, " +
                     "p.transaction_reference, p.payment_date, o.status AS order_status " +
                     "FROM payments p " +
                     "JOIN orders o ON p.order_id = o.order_id " +
                     "WHERE p.payment_id = ?";

        try {
            PaymentResponse payment = jdbcTemplate.queryForObject(sql, PAYMENT_ROW_MAPPER, paymentId);
            return Optional.ofNullable(payment);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsByOrderId(Integer orderId) {
        String sql = "SELECT COUNT(*) FROM payments WHERE order_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, orderId);
        return count != null && count > 0;
    }

    @Override
    public boolean isTransactionReferenceUsed(String transactionReference) {
        if (transactionReference == null || transactionReference.isBlank()) {
            return false;
        }
        String sql = "SELECT COUNT(*) FROM payments WHERE transaction_reference = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, transactionReference.trim());
        return count != null && count > 0;
    }
}
