Rails.application.routes.draw do
  root "home#index"

  get  "/auth/sign-in",  to: "sessions#new",      as: :sign_in
  get  "/auth/callback", to: "sessions#callback", as: :auth_callback
  delete "/auth/sign-out", to: "sessions#destroy", as: :sign_out

  get "/dashboard", to: "dashboard#index", as: :dashboard
  get "/api/me",    to: "dashboard#me",    as: :api_me
end
