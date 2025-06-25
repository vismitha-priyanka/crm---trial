package com.sharp.crm.service;

import com.sharp.crm.model.OverviewMetric;
import com.sharp.crm.repository.OverviewMetricRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OverviewMetricService {
    private final OverviewMetricRepository repository;

    public OverviewMetricService(OverviewMetricRepository repository) {
        this.repository = repository;
    }

    public List<OverviewMetric> findAll() { return repository.findAll(); }
    public OverviewMetric save(OverviewMetric stat) { return repository.save(stat); }
    public void delete(Long id) { repository.deleteById(id); }
    public Page<OverviewMetric> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
}