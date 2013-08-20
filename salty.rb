require 'bundler'
require 'rubygems'
require 'multi_json'
require 'pry'

require 'net/http'

# Control your Saltybet account from Ruby
# http://www.saltybet.com
# https://github.com/justjake/salty.rb
module Salty

  # How long the user has to place a bet before a match begins
  BET_WINDOW_DURATION = 70 * 60

  API_ENDPOINT = 'www.saltybet.com'

  # salty bet web client
  class Client

    def initialize(username, password)
      @username = username
      @password = password
    end

    # fetch saltybet.com/state.json as a dict
    def get_state_hash
      json = Net::HTTP.get(API_ENDPOINT, '/state.json')
      MultiJson.load(json)
    end

    # fetch saltybet.com/zdata.json as a dict
    def get_zdata_hash
      json = Net::HTTP.get(API_ENDPOINT, '/zdata.json')
      MultiJson.load(json)
    end

    # create a new state snapshot of saltybet and return it
    def get_state!
      @latest_state = State.new(get_state_hash(), get_zdata_hash())
    end

    def state
      @latest_state or current_state()
    end

  end

  # snapsot of saltybet state at a moment in time
  # constructed from state.json + zdata.json
  class State

    attr_reader :p1, :p2,
                :alert,
                :betstate,
                :bettors

    def betting?
      @betting
    end

    def initialize(state, zdata)
      update(state, zdata)
    end

    def int(num_string)
      num_string.split(',').join().to_i
    end

    def update(state, zdata)
      @state = state
      @zdata = zdata

      @p1 = Character.new(state['p1name'], int(state['p1total']))
      @p2 = Character.new(state['p2name'], int(state['p2total']))

      @alert = state['alert']

      @betting = state['status'] == 'open'

      @bettors = []
      zdata.each do |key, value|
        if key.to_i > 0
          b = User.from_json_data(value)
          @bettors << b
        end
      end

      return self
    end
  end

  # a castmember.
  # Represents someone you can bet on
  # TODO: implement stats DB accessor
  class Character
    attr_accessor :name, :total

    def initialize(name, total = nil)
      @name = name
      @total = total
    end
  end

  # a user on satlybet.com
  # places bets on Characters
  # TODO: figure out what all the properties in the user JSON are
  # {"n"=>"Cillu", "b"=>"2817", "p"=>"2", "w"=>"27", "r"=>"11", "g"=>"0"}
  # n: username
  # b: total saltybucks
  # g: true if this user is "gold" aka Illuminati
  # w: wager placed on this fight
  # r: bettor level
  # p: player this user last betted on
  class User
    attr_accessor :name, :cash, :wager, :illuminati, :level, :bet_on

    # create a user from JSON data
    def self.from_json_data(data)
      u = User.new()
      u.name = data['n']
      u.cash = data['b'].to_i
      u.wager = data['w'].to_i unless data['w'].nil?
      u.level = data['r'].to_i unless data['r'].nil?
      u.bet_on = data['p'].to_i unless data['p'].nil?
      u.illuminati = data['g'] == '1' unless data['g'].nil?
      return u
    end
  end

end


# dev console
c = Salty::Client.new('u', 'p')
binding.pry
