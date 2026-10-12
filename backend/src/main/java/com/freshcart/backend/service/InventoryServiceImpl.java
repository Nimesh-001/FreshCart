package com.freshcart.backend.service;

import com.freshcart.backend.dto.inventory.AdjustInventoryRequest;
import com.freshcart.backend.dto.inventory.InventoryOperationResponse;
import com.freshcart.backend.dto.inventory.LowStockItemResponse;
import com.freshcart.backend.dto.inventory.ReceiveStockRequest;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.dto.supplier.SupplierResponse;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.InventoryRepository;
import com.freshcart.backend.repository.ProductRepository;
import com.freshcart.backend.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository,
                                ProductRepository productRepository,
                                SupplierRepository supplierRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public InventoryOperationResponse receiveStock(ReceiveStockRequest request) {
        ProductResponse product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with id: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new IllegalArgumentException("Cannot receive stock for inactive product: " + product.getProductName());
        }

        SupplierResponse supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Active supplier not found with id: " + request.getSupplierId()));

        if (!Boolean.TRUE.equals(supplier.getIsActive())) {
            throw new IllegalArgumentException("Cannot receive stock from inactive supplier: " + supplier.getSupplierName());
        }

        Integer previousQuantity = inventoryRepository.getCurrentStock(request.getProductId());

        // The stored procedure handles transaction, row-locking (FOR UPDATE) and logging
        inventoryRepository.receiveStock(
                request.getProductId(),
                request.getSupplierId(),
                request.getQuantity(),
                request.getSupplierPrice()
        );

        Integer newQuantity = inventoryRepository.getCurrentStock(request.getProductId());

        return new InventoryOperationResponse(
                request.getProductId(),
                product.getProductName(),
                previousQuantity,
                request.getQuantity(),
                newQuantity,
                "STOCK_IN",
                "Stock received successfully"
        );
    }

    @Override
    public InventoryOperationResponse adjustInventory(AdjustInventoryRequest request) {
        if (request.getQuantityChange() == null || request.getQuantityChange() == 0) {
            throw new IllegalArgumentException("Quantity change cannot be zero");
        }

        ProductResponse product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!inventoryRepository.inventoryExists(request.getProductId())) {
            throw new ResourceNotFoundException("Inventory record not found for product id: " + request.getProductId());
        }

        Integer previousQuantity = inventoryRepository.getCurrentStock(request.getProductId());

        if (previousQuantity + request.getQuantityChange() < 0) {
            throw new IllegalArgumentException("Adjustment would make stock negative. Current stock: " + previousQuantity + ", requested change: " + request.getQuantityChange());
        }

        // The stored procedure handles transaction, row-locking (FOR UPDATE) and audit/movement logging
        inventoryRepository.adjustInventory(
                request.getProductId(),
                request.getQuantityChange(),
                request.getReason().trim()
        );

        Integer newQuantity = inventoryRepository.getCurrentStock(request.getProductId());

        return new InventoryOperationResponse(
                request.getProductId(),
                product.getProductName(),
                previousQuantity,
                request.getQuantityChange(),
                newQuantity,
                "ADJUSTMENT",
                "Inventory adjusted successfully"
        );
    }

    @Override
    public List<LowStockItemResponse> getLowStockItems() {
        return inventoryRepository.getLowStockItems();
    }
}
