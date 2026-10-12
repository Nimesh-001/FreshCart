package com.freshcart.backend.repository;

import com.freshcart.backend.dto.customer.AddressResponse;
import com.freshcart.backend.dto.customer.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.customer.CustomerResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CustomerJdbcRepository implements CustomerRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall registerCustomerCall;
    private SimpleJdbcCall updateCustomerProfileCall;
    private SimpleJdbcCall manageAddressCall;

    private static final RowMapper<CustomerResponse> CUSTOMER_DETAIL_ROW_MAPPER = (rs, rowNum) -> {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(rs.getInt("customer_id"));
        response.setUserId(rs.getInt("user_id"));
        response.setUsername(rs.getString("username"));
        response.setFullName(rs.getString("full_name"));
        response.setFirstName(rs.getString("first_name"));
        response.setLastName(rs.getString("last_name"));
        response.setEmail(rs.getString("email"));
        response.setPhone(rs.getString("phone"));
        response.setRole(rs.getString("role"));
        response.setIsActive(rs.getBoolean("is_active"));
        response.setCreatedAt(rs.getTimestamp("created_at"));
        return response;
    };

    private static final RowMapper<CustomerResponse> CUSTOMER_SEARCH_ROW_MAPPER = (rs, rowNum) -> {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(rs.getInt("customer_id"));
        response.setUserId(rs.getInt("user_id"));
        response.setUsername(rs.getString("username"));
        response.setFullName(rs.getString("full_name"));
        response.setEmail(rs.getString("email"));
        response.setPhone(rs.getString("phone"));
        response.setIsActive(rs.getBoolean("is_active"));
        response.setCreatedAt(rs.getTimestamp("created_at"));
        return response;
    };

    private static final RowMapper<AddressResponse> ADDRESS_ROW_MAPPER = (rs, rowNum) -> new AddressResponse(
            rs.getInt("address_id"),
            rs.getInt("customer_id"),
            rs.getString("address_line"),
            rs.getString("city"),
            rs.getString("province"),
            rs.getString("postal_code"),
            rs.getBoolean("is_default")
    );

    private static final RowMapper<CustomerPurchaseSummaryResponse> PURCHASE_SUMMARY_ROW_MAPPER = (rs, rowNum) -> new CustomerPurchaseSummaryResponse(
            rs.getInt("customer_id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getLong("total_orders"),
            rs.getBigDecimal("completed_or_paid_order_value"),
            rs.getTimestamp("latest_order_date")
    );

    public CustomerJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.registerCustomerCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_customer_register")
                .declareParameters(
                        new SqlParameter("p_username", Types.VARCHAR),
                        new SqlParameter("p_password_hash", Types.VARCHAR),
                        new SqlParameter("p_first_name", Types.VARCHAR),
                        new SqlParameter("p_last_name", Types.VARCHAR),
                        new SqlParameter("p_email", Types.VARCHAR),
                        new SqlParameter("p_phone", Types.VARCHAR),
                        new SqlOutParameter("p_customer_id", Types.INTEGER)
                );

        this.updateCustomerProfileCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_customer_update_profile")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_first_name", Types.VARCHAR),
                        new SqlParameter("p_last_name", Types.VARCHAR),
                        new SqlParameter("p_email", Types.VARCHAR),
                        new SqlParameter("p_phone", Types.VARCHAR)
                );

        this.manageAddressCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_customer_manage_address")
                .declareParameters(
                        new SqlParameter("p_action", Types.VARCHAR),
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_address_id", Types.INTEGER),
                        new SqlParameter("p_address_line", Types.VARCHAR),
                        new SqlParameter("p_city", Types.VARCHAR),
                        new SqlParameter("p_province", Types.VARCHAR),
                        new SqlParameter("p_postal_code", Types.VARCHAR),
                        new SqlParameter("p_is_default", Types.BOOLEAN),
                        new SqlOutParameter("p_result_address_id", Types.INTEGER)
                );
    }

    @Override
    public Integer registerCustomer(String username, String passwordHash, String firstName, String lastName, String email, String phone) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_username", username)
                .addValue("p_password_hash", passwordHash)
                .addValue("p_first_name", firstName)
                .addValue("p_last_name", lastName)
                .addValue("p_email", email)
                .addValue("p_phone", phone);

        Map<String, Object> out = registerCustomerCall.execute(inParams);
        Number customerId = (Number) out.get("p_customer_id");
        return customerId != null ? customerId.intValue() : null;
    }

    @Override
    public void updateCustomerProfile(Integer customerId, String firstName, String lastName, String email, String phone) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_first_name", firstName)
                .addValue("p_last_name", lastName)
                .addValue("p_email", email)
                .addValue("p_phone", phone);

        updateCustomerProfileCall.execute(inParams);
    }

    @Override
    public Integer manageAddress(String action, Integer customerId, Integer addressId, String addressLine, String city, String province, String postalCode, Boolean isDefault) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", action)
                .addValue("p_customer_id", customerId)
                .addValue("p_address_id", addressId)
                .addValue("p_address_line", addressLine)
                .addValue("p_city", city)
                .addValue("p_province", province)
                .addValue("p_postal_code", postalCode)
                .addValue("p_is_default", isDefault != null ? isDefault : false);

        Map<String, Object> out = manageAddressCall.execute(inParams);
        Number resultAddressId = (Number) out.get("p_result_address_id");
        return resultAddressId != null ? resultAddressId.intValue() : null;
    }

    @Override
    public List<AddressResponse> findAddressesByCustomerId(Integer customerId) {
        String sql = "SELECT address_id, customer_id, address_line, city, province, postal_code, is_default " +
                     "FROM addresses " +
                     "WHERE customer_id = ? " +
                     "ORDER BY is_default DESC, address_id ASC";
        return jdbcTemplate.query(sql, ADDRESS_ROW_MAPPER, customerId);
    }

    @Override
    public Optional<AddressResponse> findAddressByIdAndCustomerId(Integer addressId, Integer customerId) {
        String sql = "SELECT address_id, customer_id, address_line, city, province, postal_code, is_default " +
                     "FROM addresses " +
                     "WHERE address_id = ? AND customer_id = ?";
        List<AddressResponse> results = jdbcTemplate.query(sql, ADDRESS_ROW_MAPPER, addressId, customerId);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public Optional<CustomerResponse> findCustomerById(Integer customerId) {
        String sql = "SELECT " +
                     "    c.customer_id, " +
                     "    c.user_id, " +
                     "    u.username, " +
                     "    fn_customer_full_name(c.first_name, c.last_name) AS full_name, " +
                     "    c.first_name, " +
                     "    c.last_name, " +
                     "    c.email, " +
                     "    c.phone, " +
                     "    u.role, " +
                     "    u.is_active, " +
                     "    c.created_at " +
                     "FROM customers c " +
                     "JOIN users u ON u.user_id = c.user_id " +
                     "WHERE c.customer_id = ?";
        List<CustomerResponse> results = jdbcTemplate.query(sql, CUSTOMER_DETAIL_ROW_MAPPER, customerId);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public List<CustomerResponse> searchCustomers(String search) {
        return jdbcTemplate.query("CALL sp_customer_search(?)", CUSTOMER_SEARCH_ROW_MAPPER, search);
    }

    @Override
    public Optional<CustomerPurchaseSummaryResponse> findPurchaseSummaryByCustomerId(Integer customerId) {
        List<CustomerPurchaseSummaryResponse> results = jdbcTemplate.query(
                "CALL sp_customer_purchase_summary(?)",
                PURCHASE_SUMMARY_ROW_MAPPER,
                customerId
        );
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public boolean existsById(Integer customerId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers WHERE customer_id = ?",
                Integer.class,
                customerId
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByUsername(String username) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE username = ?",
                Integer.class,
                username
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers WHERE email = ?",
                Integer.class,
                email
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByPhone(String phone) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers WHERE phone = ?",
                Integer.class,
                phone
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByEmailAndNotCustomerId(String email, Integer customerId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers WHERE email = ? AND customer_id <> ?",
                Integer.class,
                email,
                customerId
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByPhoneAndNotCustomerId(String phone, Integer customerId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers WHERE phone = ? AND customer_id <> ?",
                Integer.class,
                phone,
                customerId
        );
        return count != null && count > 0;
    }
}
