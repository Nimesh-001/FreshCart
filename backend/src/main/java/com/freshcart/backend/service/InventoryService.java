package com.freshcart.backend.service;

import com.freshcart.backend.dto.inventory.AdjustInventoryRequest;
import com.freshcart.backend.dto.inventory.InventoryOperationResponse;
import com.freshcart.backend.dto.inventory.LowStockItemResponse;
import com.freshcart.backend.dto.inventory.ReceiveStockRequest;

import java.util.List;

public interface InventoryService {

    InventoryOperationResponse receiveStock(ReceiveStockRequest request);

    InventoryOperationResponse adjustInventory(AdjustInventoryRequest request);

    List<LowStockItemResponse> getLowStockItems();
}
