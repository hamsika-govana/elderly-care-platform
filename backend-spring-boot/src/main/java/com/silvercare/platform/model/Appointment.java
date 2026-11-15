package com.silvercare.platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    @NotBlank(message = "Hospital/Clinic name is required")
    private String hospital;

    private String address;
    private String phone;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String purpose;

    @Column(length = 2000)
    private String questionsToAsk;

    private Boolean reminderEnabled = true;
    private String status = "Upcoming";
}
