package com.freshcart.backend.repository;

import com.freshcart.backend.dto.product.ProductPerformanceResponse;
import com.freshcart.backend.dto.product.ProductResponse;
import jakarta.annotation.PostConstruct;
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
public class ProductJdbcRepository implements ProductRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall productAddCall;
    private SimpleJdbcCall productUpdateCall;

    private static final RowMapper<ProductResponse> PRODUCT_DETAIL_ROW_MAPPER = (rs, rowNum) -> {
        ProductResponse p = new ProductResponse();
        p.setProductId(rs.getInt("product_id"));
        p.setCategoryId(rs.getInt("category_id"));
        p.setCategoryName(rs.getString("category_name"));
        p.setProductName(rs.getString("product_name"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setReorderLevel(rs.getInt("reorder_level"));
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setStockStatus(rs.getString("stock_status"));
        p.setIsActive(rs.getBoolean("is_active"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        return p;
    };

    private static final RowMapper<ProductResponse> PRODUCT_SEARCH_ROW_MAPPER = (rs, rowNum) -> {
        ProductResponse p = new ProductResponse();
        p.setProductId(rs.getInt("product_id"));
        p.setProductName(rs.getString("product_name"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setCategoryId(rs.getInt("category_id"));
        p.setCategoryName(rs.getString("category_name"));
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setStockStatus(rs.getString("stock_status"));
        p.setIsActive(rs.getBoolean("is_active"));
        return p;
    };

    private static final RowMapper<ProductPerformanceResponse> PRODUCT_PERFORMANCE_ROW_MAPPER = (rs, rowNum) -> new ProductPerformanceResponse(
            rs.getInt("product_id"),
            rs.getString("product_name"),
            rs.getInt("category_id"),
            rs.getString("category_name"),
            rs.getBigDecimal("price"),
            rs.getBoolean("is_active"),
            rs.getInt("stock_quantity"),
            rs.getString("stock_status"),
            rs.getLong("units_sold"),
            rs.getBigDecimal("sales_revenue")
    );

    public ProductJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.productAddCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_product_add")
                .declareParameters(
                        new SqlParameter("p_category_id", Types.INTEGER),
                        new SqlParameter("p_product_name", Types.VARCHAR),
                        new SqlParameter("p_description", Types.VARCHAR),
                        new SqlParameter("p_price", Types.DECIMAL),
                        new SqlParameter("p_reorder_level", Types.INTEGER),
                        new SqlParameter("p_initial_quantity", Types.INTEGER),
                        new SqlOutParameter("p_product_id", Types.INTEGER)
                );

        this.productUpdateCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_product_update")
                .declareParameters(
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_category_id", Types.INTEGER),
                        new SqlParameter("p_product_name", Types.VARCHAR),
                        new SqlParameter("p_description", Types.VARCHAR),
                        new SqlParameter("p_price", Types.DECIMAL),
                        new SqlParameter("p_reorder_level", Types.INTEGER),
                        new SqlParameter("p_is_active", Types.BOOLEAN)
                );
    }

    @Override
    public Integer addProduct(Integer categoryId, String productName, String description, BigDecimal price, Integer reorderLevel, Integer initialQuantity) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_category_id", categoryId)
                .addValue("p_product_name", productName)
                .addValue("p_description", description)
                .addValue("p_price", price)
                .addValue("p_reorder_level", reorderLevel)
                .addValue("p_initial_quantity", initialQuantity);

        Map<String, Object> out = productAddCall.execute(inParams);
        Number productId = (Number) out.get("p_product_id");
        return productId != null ? productId.intValue() : null;
    }

    @Override
    public void updateProduct(Integer productId, Integer categoryId, String productName, String description, BigDecimal price, Integer reorderLevel, Boolean isActive) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_product_id", productId)
                .addValue("p_category_id", categoryId)
                .addValue("p_product_name", productName)
                .addValue("p_description", description)
                .addValue("p_price", price)
                .addValue("p_reorder_level", reorderLevel)
                .addValue("p_is_active", isActive);

        productUpdateCall.execute(inParams);
    }

    @Override
    public Optional<ProductResponse> findById(Integer productId) {
        String sql = "SELECT " +
                     "    p.product_id, " +
                     "    p.category_id, " +
                     "    c.category_name, " +
                     "    p.product_name, " +
                     "    p.description, " +
                     "    p.price, " +
                     "    p.reorder_level, " +
                     "    COALESCE(i.quantity, 0) AS stock_quantity, " +
                     "    fn_product_stock_status(COALESCE(i.quantity, 0), p.reorder_level) AS stock_status, " +
                     "    p.is_active, " +
                     "    p.created_at " +
                     "FROM products p " +
                     "LEFT JOIN categories c ON p.category_id = c.category_id " +
                     "LEFT JOIN inventory i ON p.product_id = i.product_id " +
                     "WHERE p.product_id = ?";

        List<ProductResponse> list = jdbcTemplate.query(sql, PRODUCT_DETAIL_ROW_MAPPER, productId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Override
    public List<ProductResponse> searchProducts(String search, Integer categoryId, Boolean activeOnly) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return jdbcTemplate.query("CALL sp_product_search(?, ?, ?)", PRODUCT_SEARCH_ROW_MAPPER, searchParam, categoryId, activeOnly);
    }

    @Override
    public List<ProductPerformanceResponse> findProductPerformance(Integer productId) {
        return jdbcTemplate.query("CALL sp_product_performance(?)", PRODUCT_PERFORMANCE_ROW_MAPPER, productId);
    }

    @Override
    public boolean existsById(Integer productId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE product_id = ?",
                Integer.class,
                productId
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByName(String productName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE product_name = ?",
                Integer.class,
                productName
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByNameAndNotId(String productName, Integer productId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE product_name = ? AND product_id <> ?",
                Integer.class,
                productName,
                productId
        );
        return count != null && count > 0;
    }
}
