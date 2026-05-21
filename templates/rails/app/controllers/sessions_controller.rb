class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:callback]

  def new
    @publishable_key = ENV.fetch("AUTHIO_PUBLISHABLE_KEY", "")
    @api_url = ENV.fetch("AUTHIO_API_URL", "https://api.authio.com")
    @redirect_url = params[:redirect_url].presence || "/dashboard"
  end

  def callback
    token = params[:access_token]
    redirect_to = params[:redirect].presence || "/dashboard"

    if token.blank?
      redirect_to "/auth/sign-in?error=missing_token" and return
    end

    session = Authio::Client.default.verify_token(token)
    if session.nil?
      redirect_to "/auth/sign-in?error=invalid_token" and return
    end

    cookies[:authio_session] = {
      value: token,
      httponly: true,
      secure: request.ssl?,
      same_site: :lax,
      expires: 8.hours.from_now,
    }
    redirect_to(redirect_to)
  end

  def destroy
    cookies.delete(:authio_session)
    redirect_to root_path
  end
end
