require 'roda'
require 'oddsmaker'
# require 'pry'

class App < Roda
  plugin :assets, css: ['bulma.min.css', 'app.css'], js: ['jquery-3.2.1.min.js', 'app.js']
  plugin :json
  plugin :json_parser
  if ENV['RACK_ENV'] == 'production'
    plugin :precompile_templates
    precompile_templates "views/\*\*/*.erb"
  end

  route do |r|
    r.assets# unless ENV['RACK_ENV'] == 'production'
    r.root do
      render 'index.html'
    end
    r.get 'odds' do
      puts r.params.inspect
      odds = r.params['odds'].values.map { |hash| Oddsmaker::Odd.new(hash) }
      market = Oddsmaker::Market.new(odds, name: r.params['name'])
      market.to_json
    end
  end

end
