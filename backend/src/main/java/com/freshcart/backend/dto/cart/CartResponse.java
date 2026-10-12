package com.freshcart.backend.dto.cart;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class CartResponse {

    private Integer cartId;
    private Integer customerId;
    private String status;
    private List<CartItemResponse> items = new ArrayList<>();
    private Integer totalItems;
    private Integer totalUnits;
    private BigDecimal totalAmount;
    private Timestamp updatedAt;

    public CartResponse() {}

    public CartResponse(Integer cartId, Integer customerId, String status, List<CartItemResponse> items,
                        Integer totalItems, Integer totalUnits, BigDecimal totalAmount, Timestamp updatedAt) {
        this.cartId = cartId;
        this.customerId = customerId;
        this.status = status;
        this.items = items != null ? items : new ArrayList<>();
        this.totalItems = totalItems;
        this.totalUnits = totalUnits;
        this.totalAmount = totalAmount;
        this.updatedAt = updatedAt;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
