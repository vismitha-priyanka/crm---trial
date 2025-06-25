package com.sharp.crm.controller;

import com.sharp.crm.model.DealInsight;
import com.sharp.crm.service.DealInsightService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deal-insights")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DealInsightsController {
    private final DealInsightService service;

    public DealInsightsController(DealInsightService service) {
        this.service = service;
    }

    @GetMapping
    public List<DealInsight> getAll() {
        return service.findAll();
    }

    @PostMapping
    public DealInsight save(@RequestBody DealInsight dealInsight) {
        return service.saveOrUpdate(dealInsight);
    }

    @GetMapping("/paged")
    public Page<DealInsight> getAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return service.findAll(pageable);
    }
}