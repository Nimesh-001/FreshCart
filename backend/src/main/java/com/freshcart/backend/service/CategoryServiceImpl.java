package com.freshcart.backend.service;

import com.freshcart.backend.dto.category.CategoryRequest;
import com.freshcart.backend.dto.category.CategoryResponse;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getCategoryName())) {
            throw new DuplicateResourceException("Category with name '" + request.getCategoryName() + "' already exists");
        }

        Integer categoryId = categoryRepository.createCategory(request.getCategoryName(), request.getDescription());
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created category"));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer categoryId, CategoryRequest request) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        if (categoryRepository.existsByNameAndNotId(request.getCategoryName(), categoryId)) {
            throw new DuplicateResourceException("Category name '" + request.getCategoryName() + "' already in use by another category");
        }

        categoryRepository.updateCategory(categoryId, request.getCategoryName(), request.getDescription());
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    @Override
    @Transactional
    public void deactivateCategory(Integer categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        categoryRepository.deactivateCategory(categoryId);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Boolean activeOnly) {
        return categoryRepository.findAll(activeOnly);
    }
}
