package com.sharp.crm.controller;

import com.sharp.crm.model.LeadAnalytics;
import com.sharp.crm.service.LeadAnalyticsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lead-analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class LeadAnalyticsController {
    private final LeadAnalyticsService service;

    public LeadAnalyticsController(LeadAnalyticsService service) {
        this.service = service;
    }

    @GetMapping
    public List<LeadAnalytics> getAll() {
        return service.findAll();
    }

    @PostMapping
    public LeadAnalytics save(@RequestBody LeadAnalytics leadAnalytics) {
        return service.save(leadAnalytics);
    }

    @GetMapping("/paged")
    public Page<LeadAnalytics> getAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return service.findAll(pageable);
    }
}