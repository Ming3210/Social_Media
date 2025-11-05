package ra.social_media.exception;

public class HttpUnAuthorized extends RuntimeException
{
    public HttpUnAuthorized(String message)
    {
        super(message);
    }
}
