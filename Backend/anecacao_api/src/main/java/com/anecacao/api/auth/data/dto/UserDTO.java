package com.anecacao.api.auth.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;

    private String nationalId;

    private String firstName;

    private String lastName;

    private String email;

    private String location;

    private Set<RoleDTO> roles;
}