package test_code

type ValidSubsequenceModule struct {
	module string
}

func (tc *ValidSubsequenceModule) TestCode() string {
	return `package solutions_test

	import (
		"testing"
		"github.com/connorstake/csgo/solutions"
	)

	func TestIsValidSubsequence(t *testing.T) {
		tests := []struct {
			array    []int
			sequence []int
			expected bool
		}{
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{1, 6, -1, 10}, true},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{5, 1, 22, 25, 6, -1, 8, 10}, true},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{5, 1, 22, 6, -1, 8, 10}, true},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{22, 25, 6}, true},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{5, 1, 22, 25, 6, -1, 8, 10, 12}, false},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{5, 1, 22, 22, 25, 6, -1, 8, 10}, false},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{5, 6, -1, 8}, true},
			{[]int{5, 1, 22, 25, 6, -1, 8, 10}, []int{22, 25, 7}, false},
			{[]int{5}, []int{5}, true},
			{[]int{5}, []int{1}, false},
		}
	
		for _, test := range tests {
			result := solutions.IsValidSubsequence(test.array, test.sequence)
			if result != test.expected {
				t.Errorf("IsValidSubsequence(%v, %v) = %v; want %v", test.array, test.sequence, result, test.expected)
			}
		}
	}`
}

func (tc *ValidSubsequenceModule) TestFileName() string {
	return tc.module + "_test.go"
}

func (tc *ValidSubsequenceModule) SolutionFileName() string {
	return tc.module + "_solution_user.go"
}

//Possible Solution

// arrayIdx := 0
// 	seqIdx := 0

// 	for arrayIdx < len(array) && seqIdx < len(sequence) {
// 		if array[arrayIdx] == sequence[seqIdx] {
// 			seqIdx++
// 		}
// 		arrayIdx++
// 	}

// 	return seqIdx == len(sequence)