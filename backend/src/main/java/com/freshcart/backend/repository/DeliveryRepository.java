package com.freshcart.backend.repository;

import com.freshcart.backend.dto.delivery.DeliveryResponse;

import java.util.Optional;

public interface DeliveryRepository {

    void assignDelivery(Integer orderId, String deliveryPerson, String deliveryPhone);

    void updateDeliveryStatus(Integer orderId, String newStatus);

    Optional<DeliveryResponse> findDeliveryByOrderId(Integer orderId);

    Optional<DeliveryResponse> findDeliveryById(Integer deliveryId);

    boolean existsByOrderId(Integer orderId);
}
