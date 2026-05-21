class DashboardController < ApplicationController
  before_action :authenticate_authio!

  def index
    @session = authio_session
  end

  def me
    if authio_session
      render json: authio_session.to_h
    else
      render json: { code: "unauthorized" }, status: :unauthorized
    end
  end
end
