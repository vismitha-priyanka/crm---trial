package com.sharp.crm.controller;

import com.sharp.crm.model.OverviewMetric;
import com.sharp.crm.service.OverviewMetricService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/overview-metrics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class OverviewMetricsController {
    private final OverviewMetricService service;

    public OverviewMetricsController(OverviewMetricService service) {
        this.service = service;
    }

    @GetMapping
    public List<OverviewMetric> getAll() {
        return service.findAll();
    }

    @PostMapping
    public OverviewMetric save(@RequestBody OverviewMetric overviewMetric) {
        return service.save(overviewMetric);
    }

    @GetMapping("/paged")
    public Page<OverviewMetric> getAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return service.findAll(pageable);
    }
}