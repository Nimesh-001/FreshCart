package com.freshcart.backend.repository;

import com.freshcart.backend.dto.inventory.LowStockItemResponse;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryRepository {

    void receiveStock(Integer productId, Integer supplierId, Integer quantity, BigDecimal supplierPrice);

    void adjustInventory(Integer productId, Integer quantityChange, String reason);

    Integer getCurrentStock(Integer productId);

    boolean inventoryExists(Integer productId);

    List<LowStockItemResponse> getLowStockItems();
}
