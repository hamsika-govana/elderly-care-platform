package com.silvercare.platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Medication name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Dosage is required")
    @Column(nullable = false)
    private String dosage;

    private String form;
    private String category;
    private String frequency;

    @Column(name = "time_slot")
    private String timeSlot; // Morning, Afternoon, Evening, Bedtime

    @Column(name = "exact_time")
    private String exactTime;

    @Column(name = "food_timing")
    private String foodTiming;

    @Column(name = "pills_remaining")
    private Integer pillsRemaining;

    @Column(name = "total_refill")
    private Integer totalRefill;

    @Column(name = "prescribed_by")
    private String prescribedBy;

    @Column(length = 1000)
    private String instructions;

    private String color;
}
