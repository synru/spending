
/*
   This is an example snippet - you should consider tailoring it
   to your service.
   */

async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
        "https://new-goblin-40.hasura.app/v1/graphql",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': "0nJyeGpw8BArYmEQS2z21fkXMwXHqfjlQAeWDpr38SWcDkvMBKFqvyhhSlMygNeN"
            },


            body: JSON.stringify({
                query: operationsDoc,
                variables: variables,
                operationName: operationName
            })
        }
    );

    return await result.json();
}


async function retrieveData(op) {
    const operationsDoc = `
            query spending_by_sub_cat {
                Spending_Sub_Category_Weekly_Spent {
                    Category
                    Sub_Category
                    Weekly_Spent
                    Avg_Importance_Index
                    Days_Between_Purchase
                }
            }

            query query_weekly_spent {
              Spending_Spent_By_Week_Cat {
                Category
                Week_Number
                Weekly_Spent
              }
            }
            query query_item_spent {
              Spending_Spent_By_Item {
                Category
                Sub_Category
                Item
                Importance_Index
                Weekly_Spent
              }
            }
            query query_summary {
              Spending_Purchase_aggregate {
                aggregate {
                  sum {
                    Amount
                  }
                  max {
                    Date
                  }
                  min {
                    Date
                  }
                }
              }
              Spending_Recurrent_Weekly_Spent_aggregate {
                aggregate {
                  sum {
                    Weekly_Spent
                  }
                }
              }
            }

            `;
    const { errors, data } = await fetchGraphQL(
        operationsDoc,
        op,
        {}
    );

    if (errors) {
        // handle those errors like a pro
        console.error(errors);
    }
    return data
}