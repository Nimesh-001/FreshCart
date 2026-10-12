package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.inventory.AdjustInventoryRequest;
import com.freshcart.backend.dto.inventory.InventoryOperationResponse;
import com.freshcart.backend.dto.inventory.LowStockItemResponse;
import com.freshcart.backend.dto.inventory.ReceiveStockRequest;
import com.freshcart.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/receive-stock")
    public ResponseEntity<ApiResponse<InventoryOperationResponse>> receiveStock(
            @Valid @RequestBody ReceiveStockRequest request
    ) {
        InventoryOperationResponse response = inventoryService.receiveStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock received successfully", response));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryOperationResponse>> adjustInventory(
            @Valid @RequestBody AdjustInventoryRequest request
    ) {
        InventoryOperationResponse response = inventoryService.adjustInventory(request);
        return ResponseEntity.ok(ApiResponse.success("Inventory adjusted successfully", response));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<LowStockItemResponse>>> getLowStockItems() {
        List<LowStockItemResponse> response = inventoryService.getLowStockItems();
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved successfully", response));
    }
}
