package com.freshcart.backend.repository;

import com.freshcart.backend.dto.inventory.LowStockItemResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.List;

@Repository
public class InventoryJdbcRepository implements InventoryRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall receiveStockCall;
    private SimpleJdbcCall adjustInventoryCall;

    private static final RowMapper<LowStockItemResponse> LOW_STOCK_ROW_MAPPER = (rs, rowNum) -> new LowStockItemResponse(
            rs.getInt("product_id"),
            rs.getString("product_name"),
            rs.getInt("quantity"),
            rs.getInt("reorder_level"),
            rs.getString("stock_status")
    );

    public InventoryJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.receiveStockCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_inventory_receive_stock")
                .declareParameters(
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_supplier_id", Types.INTEGER),
                        new SqlParameter("p_quantity", Types.INTEGER),
                        new SqlParameter("p_supplier_price", Types.DECIMAL)
                );

        this.adjustInventoryCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_inventory_adjust")
                .declareParameters(
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_quantity_change", Types.INTEGER),
                        new SqlParameter("p_reason", Types.VARCHAR)
                );
    }

    @Override
    public void receiveStock(Integer productId, Integer supplierId, Integer quantity, BigDecimal supplierPrice) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_product_id", productId)
                .addValue("p_supplier_id", supplierId)
                .addValue("p_quantity", quantity)
                .addValue("p_supplier_price", supplierPrice);

        receiveStockCall.execute(inParams);
    }

    @Override
    public void adjustInventory(Integer productId, Integer quantityChange, String reason) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_product_id", productId)
                .addValue("p_quantity_change", quantityChange)
                .addValue("p_reason", reason);

        adjustInventoryCall.execute(inParams);
    }

    @Override
    public Integer getCurrentStock(Integer productId) {
        try {
            return jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId);
        } catch (EmptyResultDataAccessException e) {
            return 0;
        }
    }

    @Override
    public boolean inventoryExists(Integer productId) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory WHERE product_id = ?", Integer.class, productId);
        return count != null && count > 0;
    }

    @Override
    public List<LowStockItemResponse> getLowStockItems() {
        return jdbcTemplate.query("CALL sp_inventory_low_stock()", LOW_STOCK_ROW_MAPPER);
    }
}
