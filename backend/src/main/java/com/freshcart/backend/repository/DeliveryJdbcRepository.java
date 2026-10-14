package com.freshcart.backend.repository;

import com.freshcart.backend.dto.delivery.DeliveryResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.Optional;

@Repository
public class DeliveryJdbcRepository implements DeliveryRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall deliveryAssignCall;
    private SimpleJdbcCall deliveryUpdateStatusCall;

    private static final RowMapper<DeliveryResponse> DELIVERY_ROW_MAPPER = (rs, rowNum) -> {
        DeliveryResponse response = new DeliveryResponse();
        response.setDeliveryId(rs.getInt("delivery_id"));
        response.setOrderId(rs.getInt("order_id"));
        response.setDeliveryPerson(rs.getString("delivery_person"));
        response.setDeliveryPhone(rs.getString("delivery_phone"));
        response.setDeliveryStatus(rs.getString("delivery_status"));
        response.setAssignedAt(rs.getTimestamp("assigned_at"));
        response.setDeliveredAt(rs.getTimestamp("delivered_at"));
        response.setOrderStatus(rs.getString("order_status"));
        return response;
    };

    public DeliveryJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.deliveryAssignCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_delivery_assign")
                .declareParameters(
                        new SqlParameter("p_order_id", Types.INTEGER),
                        new SqlParameter("p_delivery_person", Types.VARCHAR),
                        new SqlParameter("p_delivery_phone", Types.VARCHAR)
                );

        this.deliveryUpdateStatusCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_delivery_update_status")
                .declareParameters(
                        new SqlParameter("p_order_id", Types.INTEGER),
                        new SqlParameter("p_new_status", Types.VARCHAR)
                );
    }

    @Override
    public void assignDelivery(Integer orderId, String deliveryPerson, String deliveryPhone) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_order_id", orderId)
                .addValue("p_delivery_person", deliveryPerson)
                .addValue("p_delivery_phone", deliveryPhone);

        deliveryAssignCall.execute(inParams);
    }

    @Override
    public void updateDeliveryStatus(Integer orderId, String newStatus) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_order_id", orderId)
                .addValue("p_new_status", newStatus);

        deliveryUpdateStatusCall.execute(inParams);
    }

    @Override
    public Optional<DeliveryResponse> findDeliveryByOrderId(Integer orderId) {
        String sql = "SELECT d.delivery_id, d.order_id, d.delivery_person, d.delivery_phone, " +
                     "d.delivery_status, d.assigned_at, d.delivered_at, o.status AS order_status " +
                     "FROM deliveries d " +
                     "JOIN orders o ON d.order_id = o.order_id " +
                     "WHERE d.order_id = ?";

        try {
            DeliveryResponse delivery = jdbcTemplate.queryForObject(sql, DELIVERY_ROW_MAPPER, orderId);
            return Optional.ofNullable(delivery);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<DeliveryResponse> findDeliveryById(Integer deliveryId) {
        String sql = "SELECT d.delivery_id, d.order_id, d.delivery_person, d.delivery_phone, " +
                     "d.delivery_status, d.assigned_at, d.delivered_at, o.status AS order_status " +
                     "FROM deliveries d " +
                     "JOIN orders o ON d.order_id = o.order_id " +
                     "WHERE d.delivery_id = ?";

        try {
            DeliveryResponse delivery = jdbcTemplate.queryForObject(sql, DELIVERY_ROW_MAPPER, deliveryId);
            return Optional.ofNullable(delivery);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsByOrderId(Integer orderId) {
        String sql = "SELECT COUNT(*) FROM deliveries WHERE order_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, orderId);
        return count != null && count > 0;
    }
}
