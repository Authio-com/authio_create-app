class ApplicationController < ActionController::Base
  include AuthioAuthentication

  protect_from_forgery with: :exception

  helper_method :current_authio_session

  private

  def current_authio_session
    return nil if cookies[:authio_session].blank?

    @current_authio_session ||= Authio::Client.default.verify_token(cookies[:authio_session])
  end
end
