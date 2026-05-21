class HomeController < ApplicationController
  def index
    @session = authio_session
  end
end
