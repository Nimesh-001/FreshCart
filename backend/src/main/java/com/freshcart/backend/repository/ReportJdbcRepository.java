package com.freshcart.backend.repository;

import com.freshcart.backend.dto.report.CustomerPurchaseReportResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.report.SalesReportResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class ReportJdbcRepository implements ReportRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<SalesReportResponse> SALES_ROW_MAPPER = (rs, rowNum) -> {
        Date sqlDate = rs.getDate("sales_date");
        LocalDate localDate = sqlDate != null ? sqlDate.toLocalDate() : null;
        return new SalesReportResponse(
                localDate,
                rs.getLong("total_orders"),
                rs.getBigDecimal("total_sales"),
                rs.getLong("delivered_orders")
        );
    };

    private static final RowMapper<CustomerPurchaseReportResponse> PURCHASE_REPORT_ROW_MAPPER = (rs, rowNum) -> new CustomerPurchaseReportResponse(
            rs.getInt("customer_id"),
            rs.getString("first_name"),
            rs.getString("last_name"),
            rs.getString("email"),
            rs.getLong("total_orders"),
            rs.getBigDecimal("total_purchase_amount"),
            rs.getTimestamp("last_order_date")
    );

    private static final RowMapper<CustomerPurchaseSummaryResponse> PURCHASE_SUMMARY_ROW_MAPPER = (rs, rowNum) -> new CustomerPurchaseSummaryResponse(
            rs.getInt("customer_id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getLong("total_orders"),
            rs.getBigDecimal("completed_or_paid_order_value"),
            rs.getTimestamp("latest_order_date")
    );

    public ReportJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<SalesReportResponse> getSalesReport(LocalDate startDate, LocalDate endDate) {
        Date sqlStart = Date.valueOf(startDate);
        Date sqlEnd = Date.valueOf(endDate);
        return jdbcTemplate.query("CALL sp_sales_report(?, ?)", SALES_ROW_MAPPER, sqlStart, sqlEnd);
    }

    @Override
    public List<SalesReportResponse> getSalesReportAll() {
        String sql = "SELECT sales_date, total_orders, total_sales, delivered_orders FROM v_sales_report ORDER BY sales_date DESC";
        return jdbcTemplate.query(sql, SALES_ROW_MAPPER);
    }

    @Override
    public List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate startDate, LocalDate endDate) {
        Date sqlStart = Date.valueOf(startDate);
        Date sqlEnd = Date.valueOf(endDate);
        return jdbcTemplate.query("CALL sp_customer_purchase_report(?, ?)", PURCHASE_REPORT_ROW_MAPPER, sqlStart, sqlEnd);
    }

    @Override
    public List<CustomerPurchaseReportResponse> getCustomerPurchaseReportAll() {
        String sql = "SELECT customer_id, first_name, last_name, email, total_orders, total_purchase_amount, last_order_date " +
                     "FROM v_customer_purchase_report ORDER BY total_purchase_amount DESC, total_orders DESC";
        return jdbcTemplate.query(sql, PURCHASE_REPORT_ROW_MAPPER);
    }

    @Override
    public Optional<CustomerPurchaseReportResponse> getCustomerPurchaseReportByCustomerId(Integer customerId) {
        String sql = "SELECT customer_id, first_name, last_name, email, total_orders, total_purchase_amount, last_order_date " +
                     "FROM v_customer_purchase_report WHERE customer_id = ?";
        try {
            CustomerPurchaseReportResponse res = jdbcTemplate.queryForObject(sql, PURCHASE_REPORT_ROW_MAPPER, customerId);
            return Optional.ofNullable(res);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<CustomerPurchaseSummaryResponse> getCustomerPurchaseSummary(Integer customerId) {
        try {
            List<CustomerPurchaseSummaryResponse> list = jdbcTemplate.query(
                    "CALL sp_customer_purchase_summary(?)",
                    PURCHASE_SUMMARY_ROW_MAPPER,
                    customerId
            );
            if (list.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(list.get(0));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
