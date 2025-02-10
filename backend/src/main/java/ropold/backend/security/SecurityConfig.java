package ropold.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import ropold.backend.repository.AppUserRepository;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${app.url}")
    private String appUrl;

    private final AppUserRepository appUserRepository;

    private static final String MEMORY_HUB_PATH = "/api/memory-hub/**";


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.GET, MEMORY_HUB_PATH).permitAll()
                        .requestMatchers(HttpMethod.POST, MEMORY_HUB_PATH).authenticated()
                        .requestMatchers(HttpMethod.PUT, MEMORY_HUB_PATH).authenticated()
                        .requestMatchers(HttpMethod.DELETE, MEMORY_HUB_PATH).authenticated()
                        .requestMatchers("/api/users/me").permitAll()
                        .requestMatchers("/api/users/me/details").permitAll()
                        .anyRequest().permitAll()
                )
                .logout(l -> l.logoutUrl("/api/users/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200)))

                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .oauth2Login(o -> o.defaultSuccessUrl(appUrl));

        return http.build();
    }
}
