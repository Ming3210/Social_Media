package ra.social_media.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTProvider {

    @Value("${jwt_secret}")
    private String jwtSecret;

    @Value("${jwt_expire}") // Access token TTL (ms)
    private long jwtExpire;

    @Value("${jwt_refresh}") // Refresh token TTL (ms)
    private long jwtRefresh;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // 🟢 Tạo Access Token
    public String generateAccessToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpire))
                .signWith(getKey(), Jwts.SIG.HS512)
                .compact();
    }

    // 🟢 Tạo Refresh Token
    public String generateRefreshToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtRefresh))
                .signWith(getKey(), Jwts.SIG.HS512)
                .compact();
    }

    // 🧠 Validate Access Token
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return "access".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid access token: " + e.getMessage());
            return false;
        }
    }

    // 🧠 Validate Refresh Token
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return "refresh".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid refresh token: " + e.getMessage());
            return false;
        }
    }

    // 🔍 Lấy username từ token
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // 🧩 Lấy token từ request header
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 🔄 Refresh Access Token nếu Refresh Token hợp lệ
    public String refreshAccessToken(String refreshToken) {
        if (validateRefreshToken(refreshToken)) {
            String username = getUsernameFromToken(refreshToken);
            return generateAccessToken(username);
        }
        return null;
    }
}