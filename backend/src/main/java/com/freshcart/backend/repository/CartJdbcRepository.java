package com.freshcart.backend.repository;

import com.freshcart.backend.dto.cart.CartItemResponse;
import com.freshcart.backend.dto.cart.CartResponse;
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
import java.util.Optional;

@Repository
public class CartJdbcRepository implements CartRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall cartAddItemCall;
    private SimpleJdbcCall cartUpdateItemCall;

    private static final RowMapper<CartItemResponse> CART_ITEM_ROW_MAPPER = (rs, rowNum) -> new CartItemResponse(
            rs.getInt("cart_item_id"),
            rs.getInt("cart_id"),
            rs.getInt("product_id"),
            rs.getString("product_name"),
            rs.getBigDecimal("unit_price"),
            rs.getInt("quantity"),
            rs.getBigDecimal("subtotal"),
            rs.getInt("available_stock"),
            rs.getBoolean("product_is_active")
    );

    public CartJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.cartAddItemCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_cart_add_item")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_quantity", Types.INTEGER)
                );

        this.cartUpdateItemCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_cart_update_item")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_quantity", Types.INTEGER)
                );
    }

    @Override
    public void addItem(Integer customerId, Integer productId, Integer quantity) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_product_id", productId)
                .addValue("p_quantity", quantity);

        cartAddItemCall.execute(inParams);
    }

    @Override
    public void updateItem(Integer customerId, Integer productId, Integer quantity) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_product_id", productId)
                .addValue("p_quantity", quantity);

        cartUpdateItemCall.execute(inParams);
    }

    @Override
    public Optional<CartResponse> findActiveCartByCustomerId(Integer customerId) {
        String sql = "SELECT cart_id, customer_id, status, created_at, updated_at " +
                     "FROM carts WHERE customer_id = ? AND status = 'ACTIVE' " +
                     "ORDER BY cart_id DESC LIMIT 1";

        List<CartResponse> carts = jdbcTemplate.query(sql, (rs, rowNum) -> {
            CartResponse cart = new CartResponse();
            cart.setCartId(rs.getInt("cart_id"));
            cart.setCustomerId(rs.getInt("customer_id"));
            cart.setStatus(rs.getString("status"));
            cart.setUpdatedAt(rs.getTimestamp("updated_at"));
            return cart;
        }, customerId);

        if (carts.isEmpty()) {
            return Optional.empty();
        }

        CartResponse cart = carts.get(0);
        List<CartItemResponse> items = findCartItems(cart.getCartId());
        cart.setItems(items);

        int totalItems = items.size();
        int totalUnits = items.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalItems(totalItems);
        cart.setTotalUnits(totalUnits);
        cart.setTotalAmount(totalAmount);

        return Optional.of(cart);
    }

    @Override
    public Optional<Integer> findActiveCartIdByCustomerId(Integer customerId) {
        String sql = "SELECT cart_id FROM carts WHERE customer_id = ? AND status = 'ACTIVE' ORDER BY cart_id DESC LIMIT 1";
        try {
            Integer cartId = jdbcTemplate.queryForObject(sql, Integer.class, customerId);
            return Optional.ofNullable(cartId);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<CartItemResponse> findCartItems(Integer cartId) {
        String sql = "SELECT " +
                     "    ci.cart_item_id, " +
                     "    ci.cart_id, " +
                     "    ci.product_id, " +
                     "    p.product_name, " +
                     "    p.price AS unit_price, " +
                     "    ci.quantity, " +
                     "    (p.price * ci.quantity) AS subtotal, " +
                     "    COALESCE(i.quantity, 0) AS available_stock, " +
                     "    p.is_active AS product_is_active " +
                     "FROM cart_items ci " +
                     "JOIN products p ON ci.product_id = p.product_id " +
                     "LEFT JOIN inventory i ON p.product_id = i.product_id " +
                     "WHERE ci.cart_id = ? " +
                     "ORDER BY ci.cart_item_id ASC";

        return jdbcTemplate.query(sql, CART_ITEM_ROW_MAPPER, cartId);
    }
}
