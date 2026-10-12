package com.freshcart.backend.repository;

import com.freshcart.backend.dto.category.CategoryResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class CategoryJdbcRepository implements CategoryRepository {

    private final JdbcTemplate jdbcTemplate;
    private SimpleJdbcCall categoryManageCall;

    private static final RowMapper<CategoryResponse> CATEGORY_ROW_MAPPER = (rs, rowNum) -> new CategoryResponse(
            rs.getInt("category_id"),
            rs.getString("category_name"),
            rs.getString("description"),
            rs.getBoolean("is_active")
    );

    public CategoryJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.categoryManageCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_category_manage")
                .declareParameters(
                        new SqlParameter("p_action", Types.VARCHAR),
                        new SqlParameter("p_category_id", Types.INTEGER),
                        new SqlParameter("p_category_name", Types.VARCHAR),
                        new SqlParameter("p_description", Types.VARCHAR)
                );
    }

    @Override
    public Integer createCategory(String categoryName, String description) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", "ADD")
                .addValue("p_category_id", null)
                .addValue("p_category_name", categoryName)
                .addValue("p_description", description);

        categoryManageCall.execute(inParams);

        return jdbcTemplate.queryForObject(
                "SELECT category_id FROM categories WHERE category_name = ?",
                Integer.class,
                categoryName
        );
    }

    @Override
    public void updateCategory(Integer categoryId, String categoryName, String description) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", "UPDATE")
                .addValue("p_category_id", categoryId)
                .addValue("p_category_name", categoryName)
                .addValue("p_description", description);

        categoryManageCall.execute(inParams);
    }

    @Override
    public void deactivateCategory(Integer categoryId) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", "DEACTIVATE")
                .addValue("p_category_id", categoryId)
                .addValue("p_category_name", null)
                .addValue("p_description", null);

        categoryManageCall.execute(inParams);
    }

    @Override
    public Optional<CategoryResponse> findById(Integer categoryId) {
        String sql = "SELECT category_id, category_name, description, is_active FROM categories WHERE category_id = ?";
        List<CategoryResponse> list = jdbcTemplate.query(sql, CATEGORY_ROW_MAPPER, categoryId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Override
    public List<CategoryResponse> findAll(Boolean activeOnly) {
        boolean filterActive = activeOnly != null && activeOnly;
        String sql = "SELECT category_id, category_name, description, is_active FROM categories " +
                     (filterActive ? "WHERE is_active = TRUE " : "") +
                     "ORDER BY category_name ASC";
        return jdbcTemplate.query(sql, CATEGORY_ROW_MAPPER);
    }

    @Override
    public boolean existsById(Integer categoryId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categories WHERE category_id = ?",
                Integer.class,
                categoryId
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByName(String categoryName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categories WHERE category_name = ?",
                Integer.class,
                categoryName
        );
        return count != null && count > 0;
    }

    @Override
    public boolean existsByNameAndNotId(String categoryName, Integer categoryId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categories WHERE category_name = ? AND category_id <> ?",
                Integer.class,
                categoryName,
                categoryId
        );
        return count != null && count > 0;
    }
}
