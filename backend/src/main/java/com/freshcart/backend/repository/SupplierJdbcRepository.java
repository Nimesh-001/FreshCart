package com.freshcart.backend.repository;

import com.freshcart.backend.dto.supplier.ProductSupplierResponse;
import com.freshcart.backend.dto.supplier.SupplierResponse;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class SupplierJdbcRepository implements SupplierRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall supplierAddCall;
    private SimpleJdbcCall productSupplierManageCall;

    private static final RowMapper<SupplierResponse> SUPPLIER_ROW_MAPPER = (rs, rowNum) -> new SupplierResponse(
            rs.getInt("supplier_id"),
            rs.getString("supplier_name"),
            rs.getString("contact_person"),
            rs.getString("email"),
            rs.getString("phone"),
            rs.getString("address"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("created_at")
    );

    private static final RowMapper<ProductSupplierResponse> PRODUCT_SUPPLIER_ROW_MAPPER = (rs, rowNum) -> new ProductSupplierResponse(
            rs.getInt("product_id"),
            rs.getString("product_name"),
            rs.getInt("supplier_id"),
            rs.getString("supplier_name"),
            rs.getString("contact_person"),
            rs.getString("supplier_email"),
            rs.getString("supplier_phone"),
            rs.getBigDecimal("supplier_price"),
            rs.getDate("last_supplied_date")
    );

    public SupplierJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.supplierAddCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_supplier_add")
                .declareParameters(
                        new SqlParameter("p_supplier_name", Types.VARCHAR),
                        new SqlParameter("p_contact_person", Types.VARCHAR),
                        new SqlParameter("p_email", Types.VARCHAR),
                        new SqlParameter("p_phone", Types.VARCHAR),
                        new SqlParameter("p_address", Types.VARCHAR),
                        new SqlOutParameter("p_supplier_id", Types.INTEGER)
                );

        this.productSupplierManageCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_product_supplier_manage")
                .declareParameters(
                        new SqlParameter("p_action", Types.VARCHAR),
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_supplier_id", Types.INTEGER),
                        new SqlParameter("p_supplier_price", Types.DECIMAL)
                );
    }

    @Override
    public Integer addSupplier(String supplierName, String contactPerson, String email, String phone, String address) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_supplier_name", supplierName)
                .addValue("p_contact_person", contactPerson)
                .addValue("p_email", email)
                .addValue("p_phone", phone)
                .addValue("p_address", address);

        Map<String, Object> out = supplierAddCall.execute(inParams);
        return (Integer) out.get("p_supplier_id");
    }

    @Override
    public void manageProductSupplier(String action, Integer productId, Integer supplierId, BigDecimal supplierPrice) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", action)
                .addValue("p_product_id", productId)
                .addValue("p_supplier_id", supplierId)
                .addValue("p_supplier_price", supplierPrice);

        productSupplierManageCall.execute(inParams);
    }

    @Override
    public Optional<SupplierResponse> findById(Integer supplierId) {
        String sql = "SELECT supplier_id, supplier_name, contact_person, email, phone, address, is_active, created_at " +
                     "FROM suppliers WHERE supplier_id = ?";
        try {
            SupplierResponse supplier = jdbcTemplate.queryForObject(sql, SUPPLIER_ROW_MAPPER, supplierId);
            return Optional.ofNullable(supplier);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    @Override
    public List<SupplierResponse> findAll(Boolean activeOnly) {
        StringBuilder sql = new StringBuilder(
                "SELECT supplier_id, supplier_name, contact_person, email, phone, address, is_active, created_at FROM suppliers"
        );
        List<Object> params = new ArrayList<>();
        if (activeOnly != null) {
            sql.append(" WHERE is_active = ?");
            params.add(activeOnly);
        }
        sql.append(" ORDER BY supplier_name ASC");
        return jdbcTemplate.query(sql.toString(), SUPPLIER_ROW_MAPPER, params.toArray());
    }

    @Override
    public List<ProductSupplierResponse> findSuppliersByProductId(Integer productId) {
        String sql = "SELECT ps.product_id, p.product_name, ps.supplier_id, s.supplier_name, " +
                     "s.contact_person, s.email AS supplier_email, s.phone AS supplier_phone, " +
                     "ps.supplier_price, ps.last_supplied_date " +
                     "FROM product_suppliers ps " +
                     "JOIN suppliers s ON ps.supplier_id = s.supplier_id " +
                     "JOIN products p ON ps.product_id = p.product_id " +
                     "WHERE ps.product_id = ? " +
                     "ORDER BY s.supplier_name ASC";
        return jdbcTemplate.query(sql, PRODUCT_SUPPLIER_ROW_MAPPER, productId);
    }

    @Override
    public boolean existsById(Integer supplierId) {
        String sql = "SELECT COUNT(*) FROM suppliers WHERE supplier_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, supplierId);
        return count != null && count > 0;
    }

    @Override
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String sql = "SELECT COUNT(*) FROM suppliers WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim());
        return count != null && count > 0;
    }

    @Override
    public boolean existsByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        String sql = "SELECT COUNT(*) FROM suppliers WHERE phone = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phone.trim());
        return count != null && count > 0;
    }

    @Override
    public boolean productSupplierExists(Integer productId, Integer supplierId) {
        String sql = "SELECT COUNT(*) FROM product_suppliers WHERE product_id = ? AND supplier_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, productId, supplierId);
        return count != null && count > 0;
    }
}
