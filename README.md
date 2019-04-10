# OnStarJS
[![Build Status](https://travis-ci.org/samrum/OnStarJS.svg?branch=master)](https://travis-ci.org/samrum/OnStarJS)
[![Coverage Status](https://coveralls.io/repos/github/samrum/OnStarJS/badge.svg?branch=master)](https://coveralls.io/github/samrum/OnStarJS?branch=master)

An unofficial NodeJS library to make OnStar requests.

**Use at your own risk. This is an unofficial library.**

Only exposes a method to remote start (aka precondition) a vehicle for now. Doesn't handle any failure responses from OnStar after the initial request is made.

## Example Usage
    import OnStar from "onstarjs";

    const config = {
      deviceId: "742249ce-18e0-4c82-8bb2-9975367a7631",
      vin: "1G2ZF58B774109863",
      username: "foo@bar.com",
      password: "p@ssw0rd",
      onStarPin: "1234",
    };

    const onStar = OnStar.create(config);

    onStar.remoteStart()
      .catch(e => console.error(e))

## Credits
Made possible by [mikenemat](https://github.com/mikenemat/)'s work in [gm-onstar-probe](https://github.com/mikenemat/gm-onstar-probe). Most of the implementation follows what they were doing.
