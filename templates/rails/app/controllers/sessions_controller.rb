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
      sign_in_error("missing_token") and return
    end

    session = Authio::Client.default.verify_token(token)
    if session.nil?
      sign_in_error("invalid_token") and return
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

  private

  # Carry the error code across the bounce in a short-lived cookie
  # instead of ?error= — query-string error codes leak into browser
  # history, access logs, and Referer headers. Read (and clear) the
  # authio_signin_flash cookie on the sign-in page.
  def sign_in_error(code)
    cookies[:authio_signin_flash] = {
      value: code,
      secure: request.ssl?,
      same_site: :lax,
      expires: 1.minute.from_now,
    }
    redirect_to "/auth/sign-in"
  end
end
