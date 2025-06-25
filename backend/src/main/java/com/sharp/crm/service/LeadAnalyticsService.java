package com.sharp.crm.service;

import com.sharp.crm.model.LeadAnalytics;
import com.sharp.crm.repository.LeadAnalyticsRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeadAnalyticsService {
    private final LeadAnalyticsRepository repository;

    public LeadAnalyticsService(LeadAnalyticsRepository repository) {
        this.repository = repository;
    }

    public List<LeadAnalytics> findAll() { return repository.findAll(); }
    public LeadAnalytics save(LeadAnalytics stat) { return repository.save(stat); }
    public void delete(Long id) { repository.deleteById(id); }
    public Page<LeadAnalytics> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
}