package com.freshcart.backend.repository;

import com.freshcart.backend.dto.tracking.TrackingResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TrackingJdbcRepository implements TrackingRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<TrackingResponse> TRACKING_ROW_MAPPER = (rs, rowNum) -> {
        TrackingResponse response = new TrackingResponse();
        response.setOrderId(rs.getInt("order_id"));
        response.setCustomerId(rs.getInt("customer_id"));
        response.setOrderDate(rs.getTimestamp("order_date"));
        response.setOrderStatus(rs.getString("order_status"));
        response.setTotalAmount(rs.getBigDecimal("total_amount"));

        int paymentId = rs.getInt("payment_id");
        if (!rs.wasNull()) {
            response.setPaymentId(paymentId);
            response.setPaymentMethod(rs.getString("payment_method"));
            response.setPaymentStatus(rs.getString("payment_status"));
            response.setPaymentAmount(rs.getBigDecimal("payment_amount"));
            response.setTransactionReference(rs.getString("transaction_reference"));
            response.setPaymentDate(rs.getTimestamp("payment_date"));
            boolean simulated = !"CASH_ON_DELIVERY".equalsIgnoreCase(response.getPaymentMethod());
            response.setIsSimulatedPayment(simulated);
        }

        int deliveryId = rs.getInt("delivery_id");
        if (!rs.wasNull()) {
            response.setDeliveryId(deliveryId);
            response.setDeliveryPerson(rs.getString("delivery_person"));
            response.setDeliveryPhone(rs.getString("delivery_phone"));
            response.setDeliveryStatus(rs.getString("delivery_status"));
            response.setAssignedAt(rs.getTimestamp("assigned_at"));
            response.setDeliveredAt(rs.getTimestamp("delivered_at"));
        }

        return response;
    };

    public TrackingJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<TrackingResponse> findTrackingByOrderId(Integer orderId) {
        String sql = "SELECT order_id, customer_id, order_date, order_status, total_amount, " +
                     "payment_id, payment_method, payment_status, payment_amount, transaction_reference, payment_date, " +
                     "delivery_id, delivery_person, delivery_phone, delivery_status, assigned_at, delivered_at " +
                     "FROM v_payment_delivery_tracking WHERE order_id = ?";

        try {
            TrackingResponse tracking = jdbcTemplate.queryForObject(sql, TRACKING_ROW_MAPPER, orderId);
            return Optional.ofNullable(tracking);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<TrackingResponse> findTrackingUsingProcedure(Integer orderId) {
        return jdbcTemplate.query("CALL sp_payment_delivery_tracking(?)", TRACKING_ROW_MAPPER, orderId);
    }

    @Override
    public List<TrackingResponse> searchTracking(Integer customerId, String orderStatus, String deliveryStatus, String paymentStatus) {
        StringBuilder sql = new StringBuilder(
                "SELECT order_id, customer_id, order_date, order_status, total_amount, " +
                "payment_id, payment_method, payment_status, payment_amount, transaction_reference, payment_date, " +
                "delivery_id, delivery_person, delivery_phone, delivery_status, assigned_at, delivered_at " +
                "FROM v_payment_delivery_tracking WHERE 1=1"
        );

        List<Object> params = new ArrayList<>();

        if (customerId != null) {
            sql.append(" AND customer_id = ?");
            params.add(customerId);
        }
        if (orderStatus != null && !orderStatus.isBlank()) {
            sql.append(" AND order_status = ?");
            params.add(orderStatus.trim().toUpperCase());
        }
        if (deliveryStatus != null && !deliveryStatus.isBlank()) {
            sql.append(" AND delivery_status = ?");
            params.add(deliveryStatus.trim().toUpperCase());
        }
        if (paymentStatus != null && !paymentStatus.isBlank()) {
            sql.append(" AND payment_status = ?");
            params.add(paymentStatus.trim().toUpperCase());
        }

        sql.append(" ORDER BY order_date DESC, order_id DESC");

        return jdbcTemplate.query(sql.toString(), TRACKING_ROW_MAPPER, params.toArray());
    }
}
