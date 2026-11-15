package com.silvercare.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "*")
public class EmergencyController {

    @PostMapping("/dispatch")
    public ResponseEntity<Map<String, Object>> triggerEmergencySOS(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "DISPATCHED");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("beaconId", "SOS-" + System.currentTimeMillis());
        response.put("gpsCoordinates", "37.7749° N, 122.4194° W");
        response.put("address", "742 Evergreen Terrace, Springfield, IL");
        response.put("dispatchedTo", List.of("Emily Jenkins (Daughter)", "Sarah Miller, RN (Caregiver)", "911 Emergency Dispatch"));
        response.put("patientName", "Robert Jenkins");
        response.put("bloodGroup", "O+");
        response.put("criticalAllergies", List.of("Penicillin (Severe)"));

        return ResponseEntity.ok(response);
    }
}
