package com.anecacao.api;

import com.anecacao.api.auth.data.entity.Role;
import com.anecacao.api.auth.data.entity.RoleName;
import com.anecacao.api.auth.data.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AnecacaoApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnecacaoApiApplication.class, args);
	}

	@Bean
	CommandLineRunner initRoles(RoleRepository roleRepository) {
		return args -> {
			for (RoleName roleName : RoleName.values()) {
				roleRepository.findByName(roleName)
						.orElseGet(() -> roleRepository.save(new Role(null, roleName)));
			}
		};
	}
}
