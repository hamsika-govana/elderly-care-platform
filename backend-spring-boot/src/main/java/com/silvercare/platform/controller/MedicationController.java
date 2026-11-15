package com.silvercare.platform.controller;

import com.silvercare.platform.model.Medication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "*")
public class MedicationController {

    private final Map<Long, Medication> inMemoryDb = new LinkedHashMap<>();
    private long idCounter = 1L;

    public MedicationController() {
        // Seed initial medications
        inMemoryDb.put(1L, new Medication(1L, "Lisinopril", "10 mg", "Tablet", "Blood Pressure", "Once Daily", "Morning", "08:00", "After breakfast with water", 24, 30, "Dr. Angela Martinez", "Take with water.", "#3B82F6"));
        inMemoryDb.put(2L, new Medication(2L, "Metformin", "500 mg", "Tablet", "Blood Sugar", "Twice Daily", "Morning", "08:30", "With breakfast", 38, 60, "Dr. Robert Chen", "Take with meals.", "#10B981"));
        inMemoryDb.put(3L, new Medication(3L, "Atorvastatin", "20 mg", "Tablet", "Cholesterol", "Once Daily", "Bedtime", "21:30", "Before sleep", 6, 30, "Dr. Angela Martinez", "Take at bedtime.", "#8B5CF6"));
        idCounter = 4L;
    }

    @GetMapping
    public List<Medication> getAllMedications() {
        return new ArrayList<>(inMemoryDb.values());
    }

    @PostMapping
    public ResponseEntity<Medication> createMedication(@RequestBody Medication medication) {
        medication.setId(idCounter++);
        inMemoryDb.put(medication.getId(), medication);
        return ResponseEntity.ok(medication);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medication> updateMedication(@PathVariable Long id, @RequestBody Medication medication) {
        if (!inMemoryDb.containsKey(id)) {
            return ResponseEntity.notFound().build();
        }
        medication.setId(id);
        inMemoryDb.put(id, medication);
        return ResponseEntity.ok(medication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        if (inMemoryDb.remove(id) != null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/refill")
    public ResponseEntity<Medication> refillMedication(@PathVariable Long id, @RequestParam(defaultValue = "30") int count) {
        Medication med = inMemoryDb.get(id);
        if (med == null) return ResponseEntity.notFound().build();
        med.setPillsRemaining(med.getPillsRemaining() + count);
        return ResponseEntity.ok(med);
    }
}
