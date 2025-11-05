package ra.social_media.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ApiDataResponse<T> {
    private Boolean success;
    private T data;
    private String message;
    private HttpStatus httpStatus;
}
