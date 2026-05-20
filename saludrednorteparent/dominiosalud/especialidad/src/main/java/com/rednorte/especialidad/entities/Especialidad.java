package com.rednorte.especialidad.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entidad que representa una Especialidad Médica disponible
 * en el Servicio Público de Salud RedNorte.
 * Ejemplos: Cardiología, Oftalmología, Traumatología, Neurología, etc.
 */
@Data
@Entity
@Table(name = "especialidad")
public class Especialidad {

    @GeneratedValue(strategy = GenerationType.AUTO)
    @Id
    private long id;

    /** Código único de la especialidad (ej: "CARD", "OFTAL", "TRAUMA") */
    private String codigo;

    /** Nombre completo de la especialidad médica */
    private String nombre;

    /** Descripción de la especialidad y tipos de atención que ofrece */
    private String descripcion;
}
