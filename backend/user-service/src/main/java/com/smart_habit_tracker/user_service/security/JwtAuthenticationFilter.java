package com.smart_habit_tracker.user_service.security;

import com.smart_habit_tracker.user_service.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /*
     * JwtService is responsible for:
     *
     * 1. Validating the JWT
     * 2. Extracting the user's email from the JWT
     *
     * Lombok's @RequiredArgsConstructor creates the constructor
     * needed for Spring dependency injection.
     */
    private final JwtService jwtService;


    /*
     * This method runs for every HTTP request that passes
     * through Spring Security.
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        // ---------------------------------------------------------
        // STEP 1: Read the Authorization header
        // ---------------------------------------------------------

        /*
         * The client sends the JWT like this:
         *
         * Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
         *
         * We retrieve that complete value here.
         */
        String authHeader = request.getHeader("Authorization");


        // ---------------------------------------------------------
        // STEP 2: Check whether a JWT was actually provided
        // ---------------------------------------------------------

        /*
         * If there is no Authorization header,
         * OR it doesn't start with "Bearer ",
         *
         * we simply continue the request.
         *
         * Why?
         *
         * Because /register and /login are public endpoints.
         */
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);

            return;
        }


        // ---------------------------------------------------------
        // STEP 3: Extract only the JWT
        // ---------------------------------------------------------

        /*
         * authHeader looks like:
         *
         * "Bearer eyJhbGciOiJIUzI1NiJ9..."
         *
         * "Bearer " contains 7 characters.
         *
         * substring(7) removes "Bearer " and leaves:
         *
         * "eyJhbGciOiJIUzI1NiJ9..."
         */
        String token = authHeader.substring(7);


        // ---------------------------------------------------------
        // STEP 4: Validate the JWT
        // ---------------------------------------------------------

        /*
         * This checks whether:
         *
         * - JWT is correctly structured
         * - Signature is valid
         * - Token has not expired
         * - Token hasn't been tampered with
         */
        if (jwtService.isTokenValid(token)) {


            // -----------------------------------------------------
            // STEP 5: Extract the user's identity
            // -----------------------------------------------------

            /*
             * When we created the JWT during login,
             * we stored the email as the "subject":
             *
             * .subject(email)
             *
             * So now we retrieve that email.
             */
            String email = jwtService.extractEmail(token);


            // -----------------------------------------------------
            // STEP 6: Create Spring Security Authentication
            // -----------------------------------------------------

            /*
             * Spring Security needs an Authentication object
             * to know:
             *
             * "Who is making this request?"
             *
             * Here we tell Spring:
             *
             * Principal = user's email
             *
             * Password = null
             *
             * Authorities = null for now
             *
             * We're keeping roles/permissions simple for our MVP.
             */
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            null
                    );


            // -----------------------------------------------------
            // STEP 7: Attach request details
            // -----------------------------------------------------

            /*
             * This adds information about the current HTTP request
             * to the Authentication object.
             *
             * For example:
             * - IP address
             * - session/request details
             */
            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );


            // -----------------------------------------------------
            // STEP 8: Tell Spring Security that the user is
            // authenticated
            // -----------------------------------------------------

            /*
             * SecurityContextHolder stores the authentication
             * information for the current request.
             *
             * After this line, Spring Security knows:
             *
             * "This request is authenticated as <email>."
             */
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);
        }


        // ---------------------------------------------------------
        // STEP 9: Continue the request
        // ---------------------------------------------------------

        /*
         * VERY IMPORTANT:
         *
         * A filter must pass the request to the next filter
         * in the chain.
         *
         * Eventually the request reaches our Controller.
         */
        filterChain.doFilter(request, response);
    }
}