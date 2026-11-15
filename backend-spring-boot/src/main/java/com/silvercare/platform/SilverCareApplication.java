package com.silvercare.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SilverCareApplication {
    public static void main(String[] args) {
        SpringApplication.run(SilverCareApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  SilverCare Spring Boot Backend Server Started   ");
        System.out.println("==================================================");
    }
}
