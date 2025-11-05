package ra.social_media.config;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "djppquc7s",
                "api_key", "795681177339359",
                "api_secret", "KodU8NiCXli1PedjAOq8yMNDXzk",
                "secure", true
        ));
    }
}
