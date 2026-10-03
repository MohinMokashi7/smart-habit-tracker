package com.smart_habit_tracker.habit_service.security;

import com.smart_habit_tracker.habit_service.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Read the Authorization header
        String authHeader = request.getHeader("Authorization");


        // 2. Check whether a Bearer token was provided
        if (StringUtils.hasText(authHeader)
                && authHeader.startsWith("Bearer ")) {

            // 3. Remove "Bearer " and keep only the JWT
            String token = authHeader.substring(7);

            // 4. Validate the JWT
            if (jwtService.isTokenValid(token)) {

                // 5. Extract the user ID from the JWT
                Long userId = jwtService.extractUserId(token);

                // 6. Create an Authentication object
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                AuthorityUtils.NO_AUTHORITIES
                        );

                // 7. Store authenticated user in SecurityContext
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        }

        // 8. Continue the request
        filterChain.doFilter(request, response);
    }
}