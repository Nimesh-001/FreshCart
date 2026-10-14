package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.delivery.AssignDeliveryRequest;
import com.freshcart.backend.dto.delivery.DeliveryResponse;
import com.freshcart.backend.dto.delivery.UpdateDeliveryStatusRequest;
import com.freshcart.backend.dto.tracking.TrackingResponse;
import com.freshcart.backend.service.DeliveryService;
import com.freshcart.backend.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final TrackingService trackingService;

    public DeliveryController(DeliveryService deliveryService, TrackingService trackingService) {
        this.deliveryService = deliveryService;
        this.trackingService = trackingService;
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<DeliveryResponse>> assignDelivery(@Valid @RequestBody AssignDeliveryRequest request) {
        DeliveryResponse response = deliveryService.assignDelivery(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response));
    }

    @RequestMapping(value = "/{orderId}/status", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateDeliveryStatus(
            @PathVariable Integer orderId,
            @Valid @RequestBody UpdateDeliveryStatusRequest request
    ) {
        DeliveryResponse response = deliveryService.updateDeliveryStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryByOrderId(@PathVariable Integer orderId) {
        DeliveryResponse response = deliveryService.getDeliveryByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Delivery details retrieved successfully", response));
    }

    @GetMapping("/tracking")
    public ResponseEntity<ApiResponse<List<TrackingResponse>>> getTracking(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String deliveryStatus,
            @RequestParam(required = false) String paymentStatus
    ) {
        List<TrackingResponse> response = trackingService.searchTracking(customerId, orderStatus, deliveryStatus, paymentStatus);
        return ResponseEntity.ok(ApiResponse.success("Tracking information retrieved successfully", response));
    }

    @GetMapping("/tracking/{orderId}")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTrackingByOrderId(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer customerId
    ) {
        TrackingResponse response = trackingService.getTrackingByOrderId(orderId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Tracking information retrieved successfully", response));
    }
}
