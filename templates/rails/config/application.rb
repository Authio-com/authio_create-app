require_relative "boot"

require "rails"
require "action_controller/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = false
    config.session_store :cookie_store,
      key: "_%PROJECT_NAME%_session",
      secure: Rails.env.production?,
      same_site: :lax,
      httponly: true
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use config.session_store, config.session_options
  end
end
