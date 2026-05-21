module AuthioAuthentication
  extend ActiveSupport::Concern

  included do
    helper_method :authio_session
  end

  private

  def authenticate_authio!
    token = cookies[:authio_session]
    @authio_session = token.present? ? Authio::Client.default.verify_token(token) : nil
    unless @authio_session
      redirect_to "/auth/sign-in?redirect_url=#{CGI.escape(request.fullpath)}" and return
    end
  end

  def authio_session
    @authio_session ||= begin
      token = cookies[:authio_session]
      token.present? ? Authio::Client.default.verify_token(token) : nil
    end
  end
end
