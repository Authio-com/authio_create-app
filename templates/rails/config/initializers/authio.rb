Authio.configure do |config|
  config.api_key = ENV.fetch("AUTHIO_SECRET_KEY", "")
  config.api_url = ENV.fetch("AUTHIO_API_URL", "https://api.authio.com")
  config.publishable_key = ENV.fetch("AUTHIO_PUBLISHABLE_KEY", "")
end
