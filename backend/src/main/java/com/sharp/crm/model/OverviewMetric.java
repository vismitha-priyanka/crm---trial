package com.sharp.crm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "overview_metrics")
public class OverviewMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String value;

    public OverviewMetric() {}
    public OverviewMetric(Long id, String title, String value) {
        this.id = id;
        this.title = title;
        this.value = value;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}