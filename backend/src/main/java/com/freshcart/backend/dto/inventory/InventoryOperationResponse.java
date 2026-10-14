package com.freshcart.backend.dto.inventory;

public class InventoryOperationResponse {

    private Integer productId;
    private String productName;
    private Integer previousQuantity;
    private Integer quantityChange;
    private Integer newQuantity;
    private String operationType;
    private String message;

    public InventoryOperationResponse() {}

    public InventoryOperationResponse(Integer productId, String productName, Integer previousQuantity, Integer quantityChange, Integer newQuantity, String operationType, String message) {
        this.productId = productId;
        this.productName = productName;
        this.previousQuantity = previousQuantity;
        this.quantityChange = quantityChange;
        this.newQuantity = newQuantity;
        this.operationType = operationType;
        this.message = message;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(Integer previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public void setNewQuantity(Integer newQuantity) {
        this.newQuantity = newQuantity;
    }

    public String getOperationType() {
        return operationType;
    }

    public void setOperationType(String operationType) {
        this.operationType = operationType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
